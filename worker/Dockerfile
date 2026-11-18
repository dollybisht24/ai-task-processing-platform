# ==========================================
# Stage 1: Build Dependencies
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Create non-root application user
RUN groupadd -g 10001 workergroup && \
    useradd -u 10001 -g workergroup -s /bin/bash -m workeruser

# Copy application source code
COPY app/ ./app/

RUN chown -R workeruser:workergroup /app

USER workeruser

CMD ["python", "-m", "app.main"]
