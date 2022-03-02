# iot-simulator

IoT simulator to publish MQTT messages to AWS IoT.

## Installation

```shell
npm install -g iot-simulator
```

## Usage

```shell
 iot-simulator --private-key=PRIVATE_KEY_PATH --client-certificate=CERTIFICATE_KEY_PATH --ca-certificate=ROOTCA_KEY_PATH --host-name=ENDPOINT 
```

Optional arguemnts:

```shell
--number=2 --mpd=2 --topic=test_topic --interval-ms=500
```