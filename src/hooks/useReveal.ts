import { useEffect, useRef } from "react";

/**
 * Replica a animação "data-reveal" do design Three Minds: elementos entram
 * com fade + translateY conforme entram na viewport. Usa o mesmo contrato
 * visual do protótipo original (classe .tm-in aplicada via IntersectionObserver).
 *
 * Uso:
 *   const scopeRef = useReveal();
 *   <section ref={scopeRef}>
 *     <div data-reveal>...</div>
 *     <div data-reveal data-reveal-delay=".12">...</div>
 *   </section>
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const scopeRef = useRef<T | null>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const delay = parseFloat(target.getAttribute("data-reveal-delay") || "0");
            if (delay) target.style.transitionDelay = `${delay}s`;
            target.classList.add("tm-in");
            io.unobserve(target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    function revealOrObserve(el: HTMLElement) {
      if (el.classList.contains("tm-in")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("tm-in");
      } else {
        io.observe(el);
      }
    }

    // Elementos já presentes no primeiro render.
    scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach(revealOrObserve);

    // Elementos que aparecem depois (ex: conteúdo que só existe após um
    // fetch assíncrono terminar) — sem isso, ficavam presos em opacity:0
    // pra sempre, já que o scan acima só roda uma vez no mount.
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) revealOrObserve(node);
          node
            .querySelectorAll<HTMLElement>("[data-reveal]")
            .forEach(revealOrObserve);
        });
      });
    });
    mutationObserver.observe(scope, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return scopeRef;
}

/**
 * Replica o "count up" das estatísticas (12k+, 98%, 4.9) do design original:
 * anima do zero até o valor final quando o elemento entra na viewport.
 */
export function useCountUp(active: boolean) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => io.disconnect();
  }, [active]);

  return ref;
}