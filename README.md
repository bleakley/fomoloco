## Running local dockerized

```
docker build . -t fomoloco
docker run -p 8080:8080 --env-file env.list fomoloco
```

## Push to GCR

```
docker build . -t fomoloco
docker tag fomoloco gcr.io/nth-computing-305918/fomoloco
docker push gcr.io/nth-computing-305918/fomoloco
```