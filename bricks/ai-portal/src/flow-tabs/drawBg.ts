const dpr = window.devicePixelRatio || 1;

const TAB_HEIGHT = 40;
const BORDER_RADIUS = 12;
const slopeAngle = (Math.PI * 36) / 180; // 36度角
const deltaY = BORDER_RADIUS * (1 - Math.sin(slopeAngle));
const deltaX = BORDER_RADIUS * Math.cos(slopeAngle);
const slopeHeight = TAB_HEIGHT - deltaY * 2;
const slopeWidth = slopeHeight * Math.tan(slopeAngle);
const offsetX = deltaX + slopeWidth / 2;

export default function drawBg(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isFirstTab: boolean,
  tabOffset: number,
  tabWidth: number
) {
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.5)";

  // 创建渐变边框
  const borderGradient = ctx.createLinearGradient(0, 0, 0, height);
  borderGradient.addColorStop(0, "rgba(255,255,255,0.9)");
  borderGradient.addColorStop(1, "rgba(255,255,255,0.4)");

  ctx.lineWidth = 1;
  ctx.strokeStyle = borderGradient;

  const actualWidth = width - 1;
  const actualHeight = height - 1;

  ctx.translate(0.5, 0.5);
  ctx.beginPath();

  if (isFirstTab) {
    ctx.moveTo(0, BORDER_RADIUS);
    ctx.arcTo(0, 0, BORDER_RADIUS, 0, BORDER_RADIUS);
  } else {
    ctx.moveTo(0, BORDER_RADIUS + TAB_HEIGHT);
    ctx.arcTo(0, TAB_HEIGHT, BORDER_RADIUS, TAB_HEIGHT, BORDER_RADIUS);

    const upStartX = tabOffset - offsetX;
    ctx.lineTo(upStartX, TAB_HEIGHT);
    ctx.arc(
      upStartX,
      TAB_HEIGHT - BORDER_RADIUS,
      BORDER_RADIUS,
      Math.PI / 2,
      slopeAngle,
      true
    );

    ctx.lineTo(upStartX + deltaX + slopeWidth, deltaY);
    ctx.arc(
      upStartX + offsetX * 2,
      BORDER_RADIUS,
      BORDER_RADIUS,
      Math.PI + slopeAngle,
      Math.PI * 1.5,
      false
    );
  }

  const downStartX = tabOffset + tabWidth - offsetX;
  ctx.lineTo(downStartX, 0);
  ctx.arc(
    downStartX,
    BORDER_RADIUS,
    BORDER_RADIUS,
    Math.PI * 1.5,
    Math.PI * 2 - slopeAngle,
    false
  );

  ctx.lineTo(downStartX + deltaX + slopeWidth, TAB_HEIGHT - deltaY);
  ctx.arc(
    downStartX + offsetX * 2,
    TAB_HEIGHT - BORDER_RADIUS,
    BORDER_RADIUS,
    Math.PI - slopeAngle,
    Math.PI / 2,
    true
  );

  ctx.lineTo(actualWidth - BORDER_RADIUS, TAB_HEIGHT);
  ctx.arcTo(
    actualWidth,
    TAB_HEIGHT,
    actualWidth,
    TAB_HEIGHT + BORDER_RADIUS,
    BORDER_RADIUS
  );

  ctx.lineTo(actualWidth, actualHeight - BORDER_RADIUS);
  ctx.arcTo(
    actualWidth,
    actualHeight,
    actualWidth - BORDER_RADIUS,
    actualHeight,
    BORDER_RADIUS
  );

  ctx.lineTo(BORDER_RADIUS, actualHeight);
  ctx.arcTo(0, actualHeight, 0, actualHeight - BORDER_RADIUS, BORDER_RADIUS);

  ctx.closePath();

  ctx.fill();
  ctx.stroke();
}
