FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for document parsing
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --default-timeout=1000 torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --default-timeout=1000 -r requirements.txt

# Pre-download the Sentence-BERT model to bake it into the image
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
