FROM python:3.10-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HEALTHPAL_DEVICE=cpu \
    YOLO_CONFIG_DIR=/tmp/ultralytics \
    MPLCONFIGDIR=/tmp/matplotlib

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# The sibling AI checkout supplies the tested, pinned CPU runtime.
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY healthpal_ai ./healthpal_ai
COPY config ./config
COPY models/model-manifest.json models/model-card.json ./models/
COPY third_party ./third_party
COPY LICENSE ./LICENSE

RUN useradd --uid 10001 --create-home healthpal \
    && mkdir -p /tmp/ultralytics/Ultralytics /tmp/matplotlib \
    && chown -R healthpal:healthpal /app /tmp/ultralytics /tmp/matplotlib
USER healthpal

# The checkpoint is mounted read-only by Compose, never baked into the image.
EXPOSE 8001
CMD ["uvicorn", "healthpal_ai.app:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1", "--no-access-log"]
