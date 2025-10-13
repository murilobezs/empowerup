import { useEffect, useRef } from "react";

/**
 * Hook para animar elementos conforme entram no viewport durante o scroll.
 *
 * @param {Object} options - Configurações do observer
 * @param {number|number[]} [options.threshold=0.15] - Percentual visível para disparar a animação
 * @param {string} [options.rootMargin="0px 0px -10% 0px"] - Margem adicional para antecipar a animação
 * @param {boolean} [options.once=true] - Se true, a animação roda apenas na primeira entrada
 * @param {number} [options.delay=0] - Atraso adicional em ms aplicado à animação
 * @param {number} [options.stagger=0] - Intervalo em ms entre os elementos filhos marcados com data-reveal-child
 * @param {string} [options.childSelector="[data-reveal-child]"] - Seletor para os filhos que devem ser animados em sequência
 * @param {boolean} [options.disabled=false] - Desabilita o observer/ animação
 */
export function useScrollReveal({
  threshold = 0.15,
  root = null,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  delay = 0,
  stagger = 0,
  childSelector = "[data-reveal-child]",
  disabled = false,
} = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    const node = elementRef.current;
    if (!node) {
      return undefined;
    }

    const children = stagger > 0 ? Array.from(node.querySelectorAll(childSelector)) : [];

    const applyDelay = (target, value) => {
      if (value) {
        target.style.setProperty("--animate-delay", `${value}ms`);
      } else {
        target.style.removeProperty("--animate-delay");
      }
    };

    const revealChildren = () => {
      if (!children.length) return;

      children.forEach((child, index) => {
        applyDelay(child, delay + index * stagger);
        child.classList.add("page-reveal-ready");
      });
    };

    const resetChildren = () => {
      if (!children.length) return;

      children.forEach((child) => {
        child.classList.remove("page-reveal-ready");
        if (delay || stagger) {
          child.style.removeProperty("--animate-delay");
        }
      });
    };

    applyDelay(node, delay);

    const isBrowser = typeof window !== "undefined";
    const prefersReducedMotion =
      isBrowser && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    const supportsIntersectionObserver = isBrowser && "IntersectionObserver" in window;

    if (!supportsIntersectionObserver || prefersReducedMotion) {
      node.classList.add("page-reveal-ready");
      revealChildren();
      return () => {
        node.classList.remove("page-reveal-ready");
        resetChildren();
        applyDelay(node, 0);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("page-reveal-ready");
            revealChildren();
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            node.classList.remove("page-reveal-ready");
            resetChildren();
          }
        });
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      node.classList.remove("page-reveal-ready");
      resetChildren();
      applyDelay(node, 0);
    };
  }, [threshold, root, rootMargin, once, delay, stagger, childSelector, disabled]);

  return elementRef;
}
