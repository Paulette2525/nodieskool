"use client";
import { useEffect, useState, useRef } from "react";

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function TypingAnimation({ text, className = "", speed = 30, delay = 0 }: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Intersection Observer: start typing when element enters viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // optional delay after becoming visible
          if (delay > 0) {
            setTimeout(() => setStartTyping(true), delay);
          } else {
            setStartTyping(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!startTyping) return;
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [displayed, text, speed, startTyping]);

  return (
    <span ref={ref} className={className}>
      {startTyping ? displayed : ""}
      {(!startTyping || displayed.length < text.length) && (
        <span className="inline-block w-[2px] h-[1em] bg-primary/60 ml-0.5 animate-pulse align-middle" />
      )}
      {/* Reserve space with invisible text */}
      {!startTyping && <span className="invisible">{text}</span>}
    </span>
  );
}
