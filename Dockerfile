FROM python:3.12.4

COPY src/requirements.pip /requirements.pip
RUN pip install --no-cache-dir -r requirements.pip

ADD src /app
WORKDIR /app

EXPOSE 80

CMD ["gunicorn", "--bind=[::]:80", "app:app"]
