import React, { useEffect, useRef } from "react";
import * as Styles from "./Styles";

function Canvas({command}) {
  console.log('command🔵 ', command);
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

  // 線の描画イベント
  const draw = () => {
      propGrid.ctx.beginPath();
      propGrid.ctx.moveTo(0, 0);
      propGrid.ctx.lineTo(command.x, command.y);
      propGrid.ctx.strokeStyle = lineStyle.color;
      propGrid.ctx.lineWidth = lineStyle.width;
      propGrid.ctx.stroke();
      propGrid.ctx.closePath();
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

        draw();
    }

    if (event.type == "mouseup" || event.type == "mouseout") {
      propGrid.drawFlag = false;
    }

    if (event.type == "mousemove" && propGrid.drawFlag) {
      draw();
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
    draw()
  });

  return (
    <div>
      <canvas
        id="canvasCourse"
        width="1200"
        height="800"
        style={Styles.canvasCourse}
      ></canvas>
      <canvas
        id="canvasGrid"
        width="1200"
        height="800"
        style={Styles.canvasGrid}
      ></canvas>
    </div>
  );
}

export default Canvas;
