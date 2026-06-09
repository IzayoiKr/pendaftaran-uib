FROM python:3.12-alpine
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install fangfrisch
RUN mkdir -p /etc/fangfrisch /var/lib/clamav
