import React, { useEffect, useRef, useCallback, useState } from "react";
import * as Styles from "./Styles";
import {
  Authenticator,
  Flex,
  Button,
  TextAreaField,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const PRESET_CUBE = {
  type: "CUBE",
  image: "./image/THOUZER2.png",
  scale: 0.1, // 元画像サイズに合わせた比率
  offset: 500, // 元画像に合わせた位置調整
  size: {
    width: 1011,
    length: 901,
    tread: 244,
    towpos: -40,
    rearend: -210,
    linkpos: -40,
    camerapos: 0,
  },
};

const ImageVehicle = new Image();
ImageVehicle.src = PRESET_CUBE.image;

function Canvas({ command, client }) {
  const intervalId = useRef("");
  const exec = useRef(false);
  const [operate, setOperate] = useState(command.command);
  const directionX = useRef(1);
  const directionY = useRef(1);
  const stepX = useRef(0);
  const stepY = useRef(0);
  const speed = useRef(1);

  const propGrid = {
    canvas: "",
    ctx: "",
    drawFlag: false,
    prevX: 0,
    currX: 0,
    prevY: 0,
    currY: 0,
    dotFlag: false,
  };

  // 線のスタイルを指定
  const lineStyle = {
    color: "red",
    width: 2,
  };

  let x = 300,
    y = 300;

  // 線の描画イベント
  const draw = (x, y) => {
    propGrid.ctx.clearRect(0, 0, 600, 600);
    propGrid.ctx.strokeStyle = lineStyle.color;
    propGrid.ctx.lineWidth = lineStyle.width;
    // propGrid.ctx.beginPath();
    // propGrid.ctx.arc(x, y, 15, 0, 2 * Math.PI);
    // propGrid.ctx.stroke();
    // propGrid.ctx.closePath();
    propGrid.ctx.save();
    propGrid.ctx.scale(PRESET_CUBE.scale, PRESET_CUBE.scale);
    propGrid.ctx.translate(-PRESET_CUBE.offset, -PRESET_CUBE.offset);
    propGrid.ctx.drawImage(
      ImageVehicle,
      x / PRESET_CUBE.scale,
      y / PRESET_CUBE.scale,
      ImageVehicle.width,
      ImageVehicle.height
    );
    propGrid.ctx.restore();
  };

  const simulate = () => {
    if (x > propGrid.canvas.width - 40) directionX.current = -1;
    if (y > propGrid.canvas.height - 40) directionY.current = -1;
    if (x < 40) directionX.current = 1;
    if (y < 40) directionY.current = 1;

    draw(x, y);
    x += stepX.current * speed.current * directionX.current;
    y += stepY.current * speed.current * directionY.current;
  };

  const handleStart = () => {
    if (!exec.current) {
      intervalId.current = setInterval(simulate, 1);
      exec.current = true;
    }
  };

  const handleStop = () => {
    if (exec.current) {
      clearInterval(intervalId.current);
      exec.current = false;
    }
  };

  // マウスイベントの座標を取得及びイベント毎による処理を振り分ける
  const getCoordinate = (event) => {
    if (event.type == "mousedown" || event.type == "mousemove") {
      propGrid.prevX = propGrid.currX;
      propGrid.prevY = propGrid.currY;
      propGrid.currX = event.clientX - propGrid.canvas.offsetLeft;
      propGrid.currY = event.clientY - propGrid.canvas.offsetTop;
    }

    if (event.type == "mousedown") {
      draw(x, y);
    }

    if (event.type == "mouseup" || event.type == "mouseout") {
      propGrid.drawFlag = false;
    }

    if (event.type == "mousemove" && propGrid.drawFlag) {
      draw(x, y);
    }
  };

  useEffect(() => {
    // canvasCourse = document.getElementById("canvasCourse");
    // ctxCourse = canvasCourse.getContext("2d");
    propGrid.canvas = document.getElementById("canvasGrid");
    propGrid.ctx = propGrid.canvas.getContext("2d");
    // 線を引くイベント（mouse move）
    propGrid.canvas.addEventListener("mousemove", (event) =>
      getCoordinate(event)
    );
    // 線を引くイベント（mouse down）
    propGrid.canvas.addEventListener("mousedown", (event) =>
      getCoordinate(event)
    );
    // 線を引かないイベント（mouse up）
    propGrid.canvas.addEventListener("mouseup", (event) =>
      getCoordinate(event)
    );
    // 線を引かないイベント（mouse out）
    propGrid.canvas.addEventListener("mouseout", (event) =>
      getCoordinate(event)
    );
    draw();
  });

  useEffect(() => {
    setOperate(command.command);
    switch (command.command) {
      case "up":
        directionY.current = -1;
        stepX.current = 0;
        stepY.current = 1;
        break;
      case "left":
        directionX.current = -1;
        stepX.current = 1;
        stepY.current = 0;
        break;
      case "right":
        directionX.current = 1;
        stepX.current = 1;
        stepY.current = 0;
        break;
      case "down":
        directionY.current = 1;
        stepX.current = 0;
        stepY.current = 1;
        break;
      case "stop":
        stepX.current = 0;
        stepY.current = 0;
        break;
      case "speedUp":
        speed.current < 10 ? speed.current++ : speed.current;
        console.log("speed.current🔵 ", speed.current);
        break;
      case "speedDown":
        speed.current > 1 ? speed.current-- : speed.current;
        console.log("speed.current🔵 ", speed.current);
        break;
      default:
        break;
    }
  }, [command]);

  return (
    <div>
      <canvas
        id="canvasCourse"
        width="600"
        height="600"
        style={Styles.canvasCourse}
      ></canvas>
      <canvas
        id="canvasGrid"
        width="600"
        height="600"
        style={Styles.canvasGrid}
      ></canvas>
      <Flex width={700} direction="column" alignItems={"center"}>
        <h3>MQTT Driving Simulator</h3>
        <Flex direction="row" alignItems={"center"}>
          <Button width={100} onClick={handleStart}>
            Start
          </Button>
          <Button width={100} onClick={handleStop}>
            Stop
          </Button>
        </Flex>
        <label>
          Command
          <TextAreaField
            marginTop={0}
            name="postContent"
            rows={1}
            cols={40}
            value={operate}
          />
        </label>
      </Flex>
      <Flex></Flex>
    </div>
  );
}

export default Canvas;
