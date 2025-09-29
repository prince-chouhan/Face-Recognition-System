# app/db.py
import os
import mysql.connector
from datetime import datetime

MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql_db")
MYSQL_USER = os.getenv("MYSQL_USER", "eduuser")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "edepass")
MYSQL_DB = os.getenv("MYSQL_DATABASE", "attendance_db")

def get_conn():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        auth_plugin='mysql_native_password'
    )

def mark_attendance_unique(roll_no, name, confidence, image_path):
    """
    Insert attendance once per day. If roll_no provided and the DB has a roll_no column,
    dedupe by roll_no; otherwise fallback to dedupe by name.
    Returns True if inserted, False if skipped or on error.
    """
    from datetime import datetime

    # normalize roll_no to int if possible
    roll_int = None
    if roll_no is not None:
        try:
            roll_int = int(roll_no)
        except Exception:
            roll_int = None

    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now()

    # Try to check last record either by roll_no (if provided) or by name.
    roll_col_exists = False
    r = None
    try:
        if roll_int is not None:
            # try using roll_no column (may raise if column doesn't exist)
            cur.execute("SELECT timestamp FROM attendance WHERE roll_no=%s ORDER BY timestamp DESC LIMIT 1", (roll_int,))
            r = cur.fetchone()
            roll_col_exists = True
        else:
            cur.execute("SELECT timestamp FROM attendance WHERE name=%s ORDER BY timestamp DESC LIMIT 1", (name,))
            r = cur.fetchone()
    except Exception:
        # fallback to name-based lookup if roll_no query failed or other error
        try:
            cur.execute("SELECT timestamp FROM attendance WHERE name=%s ORDER BY timestamp DESC LIMIT 1", (name,))
            r = cur.fetchone()
        except Exception as e:
            print("DB lookup error:", e)
            cur.close()
            conn.close()
            return False

    do_insert = True
    if r:
        last_ts = r[0]
        if isinstance(last_ts, datetime) and last_ts.date() == now.date():
            do_insert = False

    inserted = False
    if do_insert:
        try:
            if roll_int is not None and roll_col_exists:
                cur.execute(
                    "INSERT INTO attendance (roll_no, name, confidence, image_path) VALUES (%s, %s, %s, %s)",
                    (roll_int, name, float(confidence), image_path)
                )
            else:
                cur.execute(
                    "INSERT INTO attendance (name, confidence, image_path) VALUES (%s, %s, %s)",
                    (name, float(confidence), image_path)
                )
            conn.commit()
            inserted = True
        except Exception as e:
            print("DB insert error:", e)
            try:
                conn.rollback()
            except Exception:
                pass
            inserted = False

    cur.close()
    conn.close()
    return inserted

def get_all_attendance():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    # include roll_no in select
    cur.execute("SELECT roll_no, name, confidence, image_path, timestamp FROM attendance ORDER BY timestamp DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
