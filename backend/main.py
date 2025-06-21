from dotenv import load_dotenv
import os

load_dotenv()
#from database import save_publication
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.app:app", host="0.0.0.0", log_level="info")
