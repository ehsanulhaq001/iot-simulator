/*

This code can be used to simulate IoT devices publishing data to the AWS IoT Core.
User can edit the number_of_devices and the number of messages_per_device to be published.
The function publishes the data every 1 second by default.

Please check the AWS IoT sdk js documentation: https://github.com/aws/aws-iot-device-sdk-js#device-class

@author Ehsan Ul Haq
@since 03-03-2022
@version 1.0

*/

module.exports = (argv) => {
  // You can change the sdk to the newer aws-iot-device-sdk-v2 version.
  const args = getArgs(argv);

  let awsIot = require("aws-iot-device-sdk");

  let device = {
    keyPath: args["private-key"],
    certPath: args["client-certificate"],
    caPath: args["ca-certificate"],
    host: args["host-name"],
  };

  let devices = [];
  let count = [];
  let timeout = [];
  let cleared = 0;

  // variables to be edited
  const inter = args["interval-ms"] ? parseInt(args["interval-ms"]) : 1000;
  const number_of_devices = args["number"] ? parseInt(args["number"]) : 1;
  const messages_per_device = args["mpd"] ? parseInt(args["mpd"]) : 5;
  const iot_topic = args["topic"] ? args["topic"] : "test_topic";

  console.log(
    "\n..........................................\n\nSimulating",
    number_of_devices,
    "IoT devices for Temperature,\npublishing a total of",
    messages_per_device,
    "messages after every",
    inter,
    "milliseconds \nto topic:",
    iot_topic,
    "\n"
  );

  for (let i = 0; i < number_of_devices; i++) {
    let tempDevice = device;
    tempDevice.clientId = "device_id_" + (i + 1).toString();
    devices[i] = awsIot.device(tempDevice);
    count.push(0);
    timeout.push(null);
  }

  devices.forEach((device, i) => {
    device.on("connect", function () {
      console.log("Device", i + 1, "connected");
      device.subscribe(iot_topic);
      timeout[i] = setInterval(() => publishData(device, i), inter);
    });
  });

  let first_time = true;

  function publishData(device, i) {
    if (first_time) {
      console.log(
        "\n    ----------------------------------------------------------------",
        "\n",
        "\r    |  Device_ID  |  Item  |              Published_at             |",
        "\n    ----------------------------------------------------------------"
      );

      first_time = false;
    }

    count[i]++;

    // clear interval if messages_per_device is reached
    if (count[i] > messages_per_device) {
      clearInterval(timeout[i]);
      cleared++;
      checkFinished();
      return;
    }

    // make payload

    let sensor_payload = createPayload(
      {
        type: "sensor",
        id: `device_id_${i + 1}`,
      },
      {
        bat_percentage: 86.66666666666667,
        count: 226,
        events: "motion",
        status: 1,
        temp: 6,
        time: 0,
        voltage: 3.6,
      },
      {
        property: "value",
      },
      {
        sensor_type: "Temperature",
        value: Math.random() * 10 + 25,
        unit: "C",
      },
      new Date().toISOString()
    );

    let gateway_payload = createPayload(
      {
        type: "gateway",
        id: `gateway_id_1`,
      },
      {
        bat_percentage: 86.66666666666667,
        count: 226,
        events: "motion",
        status: 1,
        temp: 6,
        time: 0,
        voltage: 3.6,
      },
      {
        property: "value",
      },
      sensor_payload,
      new Date().toISOString()
    );

    // publish data to the topic iot_topic
    device.publish(iot_topic, JSON.stringify(gateway_payload));

    console.log(
      "    |   ",
      i + 1,
      i + 1 > 99 ? "" : i + 1 > 9 ? " " : "  ",
      "    |  ",
      count[i],
      count[i] > 99 ? "" : count[i] > 9 ? " " : "  ",
      "|      ",
      new Date(),
      "       |"
    );
  }
  function checkFinished() {
    // if all intervals are cleared i.e. all devices have published messages_per_device messages, then exit
    if (cleared === number_of_devices) {
      console.log(
        "    ----------------------------------------------------------------",
        "\n\nAll messages published\n"
      );
      process.exit();
    }
  }
};

const createPayload = (device, condition, settings, data, published_at) => {
  return {
    device,
    message: {
      metadata: {
        condition,
        settings,
      },
      data,
      published_at,
    },
  };
};

const getArgs = (argv) => {
  const args = {};
  process.argv.slice(2, process.argv.length).forEach((arg) => {
    // long arg
    if (arg.slice(0, 2) === "--") {
      const longArg = arg.split("=");
      const longArgFlag = longArg[0].slice(2, longArg[0].length);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === "-") {
      const flags = arg.slice(1, arg.length).split("");
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
  });
  return args;
};
