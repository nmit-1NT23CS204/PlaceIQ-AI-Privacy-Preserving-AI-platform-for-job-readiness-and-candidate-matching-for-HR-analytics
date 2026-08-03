import requests

def test_extract_text_none_filename():
    url = "http://localhost:8000/extract-text"
    # Create a dummy file without a filename if possible, or just mock the call
    # Actually, it's easier to just call the function directly if I were in python, 
    # but I'll try to use requests with a file that has no name.
    
    files = {'file': (None, b'test content', 'text/plain')}
    try:
        response = requests.post(url, files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_extract_text_none_filename()
