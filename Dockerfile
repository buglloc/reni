FROM python:3.6.0
MAINTAINER Andrew Krasichkov "buglloc@yandex-team.ru"

ENV DEBIAN_FRONTEND noninteractive
COPY src/requirements.pip /requirements.pip
RUN pip install --no-cache-dir -i https://pypi.yandex-team.ru/simple/ -r requirements.pip

ADD src /app
WORKDIR /app

CMD gunicorn --bind [::]:80 app:app
