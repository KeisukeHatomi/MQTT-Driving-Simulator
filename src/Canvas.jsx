import React, { useEffect, useRef, useCallback, useState } from "react";
import * as Styles from "./Styles";
import { Authenticator, Flex, Button, TextAreaField, Divider, Grid, Card, Tabs } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { PRESET_THOUZER, ImageVehicle } from "./PresetVehicle";
import * as P2D from "./CoordinateFunctions";
import { Point } from "./CoordinateFunctions";
import { AUTOSTART, OPERATION } from "./OperationPatern";
import { CCart } from "./CCart";
import { CLandMark } from "./CLandmark";
import { CCourse } from "./CCourse";

const DEBUG = false;
const DEFAULT_SCALE = 0.1;

function Canvas({ command, client }) {
  const [operate, setOperate] = useState(command.command);
    const [tab, setTab] = useState("1");
  const intervalId = useRef("");
  const exec = useRef(false);
  const directionX = useRef(1);
  const directionY = useRef(1);
  const stepX = useRef(0);
  const stepY = useRef(0);
  const speed = useRef(1);
  const offset = useRef(Point.Zero());
  const scale = useRef(DEFAULT_SCALE);

  const ctxGrid = {
    canvas: "",
    ctx: "",
  };

  const ctxCart = {
    canvas: "",
    ctx: "",
  };
  const ctxCourse = {
    canvas: "",
    ctx: "",
  };

  let x = 300,
    y = 300;

  // 線の描画イベント
  const drawCart = (x, y) => {
    if (x > ctxCart.canvas.width - 40) directionX.current = -1;
    if (y > ctxCart.canvas.height - 40) directionY.current = -1;
    if (x < 40) directionX.current = 1;
    if (y < 40) directionY.current = 1;

    ctxCart.ctx.clearRect(0, 0, ctxCart.canvas.width, ctxCart.canvas.height);
    ctxCart.ctx.save();
    ctxCart.ctx.scale(PRESET_THOUZER.scale, PRESET_THOUZER.scale);
    ctxCart.ctx.translate(-PRESET_THOUZER.offset, -PRESET_THOUZER.offset);
    ctxCart.ctx.drawImage(
      ImageVehicle,
      x / PRESET_THOUZER.scale,
      y / PRESET_THOUZER.scale,
      ImageVehicle.width,
      ImageVehicle.height
    );
    ctxCart.ctx.restore();
  };

  /**
   * Gridキャンパスに5m,1mグリッドを描画
   */
  const drawGrid = () => {
    ctxGrid.ctx.clearRect(0, 0, ctxGrid.canvas.width, ctxGrid.canvas.height);

    // 1m間隔グリッド
    ctxGrid.ctx.lineWidth = "1";
    ctxGrid.ctx.strokeStyle = "rgb(225,225,225)";
    for (let x = 0; x < ctxGrid.canvas.width + offset.current.x; x += 1000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(x - offset.current.x, 0);
      ctxGrid.ctx.lineTo(x - offset.current.x, ctxGrid.canvas.height);
      ctxGrid.ctx.stroke();
    }
    for (let y = 0; y < ctxGrid.canvas.height + offset.current.y; y += 1000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(0, y - offset.current.y);
      ctxGrid.ctx.lineTo(ctxGrid.canvas.width, y - offset.current.y);
      ctxGrid.ctx.stroke();
    }
    for (let x = 0; x > -ctxGrid.canvas.width + offset.current.x; x -= 1000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(x - offset.current.x, 0);
      ctxGrid.ctx.lineTo(x - offset.currentx, ctxGrid.canvas.height);
      ctxGrid.ctx.stroke();
    }
    for (let y = 0; y > -ctxGrid.canvas.height + offset.current.y; y -= 1000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(0, y - offset.current.y);
      ctxGrid.ctx.lineTo(ctxGrid.canvas.width, y - offset.current.y);
      ctxGrid.ctx.stroke();
    }

    // 5m間隔グリッド
    ctxGrid.ctx.lineWidth = "1";
    ctxGrid.ctx.strokeStyle = "rgb(192,192,192)";
    for (let x = 0; x < ctxGrid.canvas.width + offset.current.x; x += 5000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(x - offset.current.x, 0);
      ctxGrid.ctx.lineTo(x - offset.current.x, ctxGrid.canvas.height);
      ctxGrid.ctx.stroke();
    }
    for (let y = 0; y < ctxGrid.canvas.height + offset.current.y; y += 5000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(0, y - offset.current.y);
      ctxGrid.ctx.lineTo(ctxGrid.canvas.width, y - offset.current.y);
      ctxGrid.ctx.stroke();
    }
    for (let x = 0; x > -ctxGrid.canvas.width + offset.current.x; x -= 5000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(x - offset.current.x, 0);
      ctxGrid.ctx.lineTo(x - offset.current.x, ctxGrid.canvas.height);
      ctxGrid.ctx.stroke();
    }
    for (let y = 0; y > -ctxGrid.canvas.height + offset.current.y; y -= 5000 * scale.current) {
      ctxGrid.ctx.beginPath();
      ctxGrid.ctx.moveTo(0, y - offset.current.y);
      ctxGrid.ctx.lineTo(ctxGrid.canvas.width, y - offset.current.y);
      ctxGrid.ctx.stroke();
    }
  };

  const simulate = () => {
    drawGrid();
    drawCart(x, y);
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

  /**
   * マウスイベントの座標を取得及びイベント毎による処理を振り分ける
   * @param {*} event
   */
  const getCoordinate = (event) => {
    if (event.type == "mousedown" || event.type == "mousemove") {
      ctxGrid.ctx.prevX = ctxGrid.ctx.currX;
      ctxGrid.ctx.prevY = ctxGrid.ctx.currY;
      ctxGrid.ctx.currX = event.clientX - ctxGrid.ctx.canvas.offsetLeft;
      ctxGrid.ctx.currY = event.clientY - ctxGrid.ctx.canvas.offsetTop;
    }

    if (event.type == "mousedown") {
      drawCart(x, y);
    }

    if (event.type == "mouseup" || event.type == "mouseout") {
      ctxGrid.ctx.drawFlag = false;
    }

    if (event.type == "mousemove" && ctxGrid.ctx.drawFlag) {
      drawCart(x, y);
    }
  };

  function onKeyDown(e) {
    if (e.shiftKey) {
      document.body.style.cursor = "move";
    }

    if (e.keyCode == 27) {
      // ESC key
      if (IsMarkLayoutMode && !IsMarkReLayoutMode) {
        // 新規配置のとき
        keyPressEsc = true;
        OnMarkLayoutButtonClick();
      }
      if (IsMarkReLayoutMode) {
        // 修正のとき
        keyPressEsc = true;
        LandMarkLayout[MarkSelectingId].Fix = true;
        DrawCourse(); // コース再描画
        IsMarkLayoutMode = false;
        IsMarkReLayoutMode = false;
      }
      if (IsCourseLayoutMode || IsCourseReLayoutMode) {
        keyPressEsc = true;
        OnCourseLayoutButtonClick();
      }
      if (IsCartMovingMode) {
        CVehicle.Calc(prevCartPos, prevCartDeg);
        IsCartMovingMode = false;
        IsCartSelecting = false;
      }
    }

    if (e.keyCode == 46) {
      // DELETE key
      if (IsMarkReLayoutMode) {
        // 修正のとき
        LandMarkLayout.splice(MarkSelectingId, 1);
        DrawCourse(); // コース再描画
        IsMarkLayoutMode = false;
        IsMarkReLayoutMode = false;
      }
      if (IsCourseReLayoutMode) {
        if (CoursePosiesSelectingId >= 0) {
          // 点が選択されているときは点だけを削除
          let pos = CourseLayout[CourseSelectingId].Position;
          if (pos.length > 2) {
            //残点が2個より多い場合は点を削除
            CourseLayout[CourseSelectingId].Position.splice(CoursePosiesSelectingId, 1);
          } else {
            //残点が2個以下の場合は全部削除
            CourseLayout.splice(CourseSelectingId, 1);
          }
        }
        DrawCourse(); // コース再描画
        IsCourseLayoutMode = false;
        IsCourseReLayoutMode = false;
      }
    }

    UpdateCourseTextData();
    //console.log("keyDown: " + e.keyCode);
  }

  function onKeyUp(e) {
    if (!e.shiftKey) {
      if (IsMarkLayoutMode || IsCourseLayoutMode) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "auto";
      }
    }
    if (e.keyCode == 27) {
      keyPressEsc = false;
    }
    UpdateCourseTextData();
  }

  useEffect(() => {
    ctxGrid.canvas = document.getElementById("canvasGrid");
    ctxGrid.ctx = canvasCourse.getContext("2d");
    ctxCart.canvas = document.getElementById("canvasCart");
    ctxCart.ctx = ctxCart.canvas.getContext("2d");
    ctxCourse.canvas = document.getElementById("canvasCourse");
    ctxCourse.ctx = ctxCart.canvas.getContext("2d");

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // // 線を引くイベント（mouse move）
    // ctxCart.canvas.addEventListener("mousemove", (event) => getCoordinate(event));
    // // 線を引くイベント（mouse down）
    // ctxCart.canvas.addEventListener("mousedown", (event) => getCoordinate(event));
    // // 線を引かないイベント（mouse up）
    // ctxCart.canvas.addEventListener("mouseup", (event) => getCoordinate(event));
    // // 線を引かないイベント（mouse out）
    // ctxCart.canvas.addEventListener("mouseout", (event) => getCoordinate(event));
    // drawCart();
  });

  /**
   * MQTT コマンドを受信した場合の処理
   */
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
        break;
      case "speedDown":
        speed.current > 1 ? speed.current-- : speed.current;
        break;
      default:
        break;
    }
  }, [command]);

  return (
    <Grid columnGap="0.5rem" rowGap="0.5rem" templateColumns="500px 1fr" templateRows="1fr 8fr 1fr">
      <Card columnStart="1" columnEnd="-1">
        <h3>MQTT Driving Simulator</h3>
      </Card>
      <Card rowStart="2" rowEnd="-1">
        <Tabs
          value={tab}
          onValueChange={(tab) => setTab(tab)}
          items={[
            {
              label: "First",
              value: "1",
              content: (
                <Flex width={500} direction="column" alignItems={"center"}>
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
                    <TextAreaField marginTop={0} name="postContent" rows={1} cols={40} value={operate} />
                  </label>
                </Flex>
              ),
            },
            {
              label: "Second",
              value: "2",
              content: (
                <>
                  <p>Content of the second tab.</p>
                  <Button isFullWidth onClick={() => setTab("1")}>
                    Go to first tab
                  </Button>
                </>
              ),
            },
          ]}
        />
      </Card>
      <Card columnStart="2" columnEnd="-1">
        <Flex minWidth={1000}>
          <canvas id="canvasGrid" width="1360" height="765" style={Styles.canvasGrid}></canvas>
          <canvas id="canvasCourse" width="1360" height="765" style={Styles.canvasCourse}></canvas>
          <canvas id="canvasCart" width="1360" height="765" style={Styles.canvasCart}></canvas>
        </Flex>
      </Card>
      <Card columnStart="2" columnEnd="-1">
        Footer
      </Card>
    </Grid>
  );
}

export default Canvas;
