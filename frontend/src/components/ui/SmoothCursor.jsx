"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring } from 'framer-motion';

const DESKTOP_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)";

function isTrackablePointer(pointerType) {
  return pointerType !== "touch";
}

const DefaultCursorSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ transform: "scale(0.55)", transformOrigin: "center center" }}
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="#0B0B0F"
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="#FFFFFF"
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
}) {
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      const nextIsEnabled = mediaQuery.matches && !reducedMotionQuery.matches;
      setIsEnabled(nextIsEnabled);

      if (!nextIsEnabled) {
        setIsVisible(false);
      }
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);
    reducedMotionQuery.addEventListener("change", updateEnabled);
    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      reducedMotionQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const handlePointerMove = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;

      const now = Date.now();
      const dt = Math.max((now - lastUpdateTime.current) / 1000, 0.001);
      lastUpdateTime.current = now;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const dx = currentX - lastMousePos.current.x;
      const dy = currentY - lastMousePos.current.y;

      velocity.current = {
        x: dx / dt,
        y: dy / dt,
      };

      cursorX.set(currentX);
      cursorY.set(currentY);

      const distance = Math.hypot(dx, dy);
      if (distance > 1.2) {
        // SVG arrow points upwards by default (+90 deg rotates towards velocity vector)
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        let deltaAngle = targetAngle - previousAngle.current;

        while (deltaAngle < -180) deltaAngle += 360;
        while (deltaAngle > 180) deltaAngle -= 360;

        accumulatedRotation.current += deltaAngle;
        previousAngle.current = targetAngle;
        rotation.set(accumulatedRotation.current);
      }

      lastMousePos.current = { x: currentX, y: currentY };

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handlePointerDown = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;
      scale.set(0.85);
    };

    const handlePointerUp = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;
      scale.set(1);
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    const handlePointerEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("mouseleave", handlePointerLeave);
    document.addEventListener("mouseenter", handlePointerEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("mouseenter", handlePointerEnter);
    };
  }, [isEnabled, isVisible, cursorX, cursorY, rotation, scale]);

  useEffect(() => {
    if (isEnabled && isVisible) {
      document.documentElement.classList.add("smooth-cursor-active");
    } else {
      document.documentElement.classList.remove("smooth-cursor-active");
    }
    return () => {
      document.documentElement.classList.remove("smooth-cursor-active");
    };
  }, [isEnabled, isVisible]);

  if (!isEnabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[99999]"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {cursor}
    </motion.div>
  );
}

export default SmoothCursor;
