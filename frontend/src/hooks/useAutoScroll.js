import { useEffect, useRef, useCallback } from "react";

export default function useAutoScroll(...dependencies) {
  const endRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "auto") => {
    endRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, dependencies);

  return {
    endRef,
    scrollToBottom,
  };
}

// import { useEffect, useRef } from "react";

// export default function useAutoScroll(...dependencies) {
//   const endRef = useRef(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({
//       behavior: "smooth",
//     });
//   }, dependencies);

//   return endRef;
// }