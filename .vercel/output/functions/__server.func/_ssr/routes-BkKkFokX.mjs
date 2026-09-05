import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as CloudSun, i as Eye, n as Footprints, r as Flower2 } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BkKkFokX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var GAME_KEYS = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowLeft",
	"ArrowDown",
	"ArrowRight",
	"KeyE",
	"Space"
]);
var held = /* @__PURE__ */ new Set();
var injected = null;
var touchSteer = {
	x: 0,
	y: 0
};
var lookState = {
	yaw: 0,
	pitch: .08,
	dragging: false,
	pointerId: -1
};
function isDown(code) {
	if (injected) return injected.includes(code);
	return held.has(code);
}
function setInjectedKeys(codes) {
	if (codes.length === 0) {
		injected = null;
		held.clear();
		return;
	}
	injected = codes;
}
function bindGardenInput() {
	const onDown = (e) => {
		if (e.repeat) return;
		held.add(e.code);
		if (GAME_KEYS.has(e.code)) e.preventDefault();
	};
	const onUp = (e) => {
		held.delete(e.code);
	};
	const onClear = () => held.clear();
	window.addEventListener("keydown", onDown);
	window.addEventListener("keyup", onUp);
	window.addEventListener("blur", onClear);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) onClear();
	});
	return () => {
		window.removeEventListener("keydown", onDown);
		window.removeEventListener("keyup", onUp);
		window.removeEventListener("blur", onClear);
	};
}
function radialDeadzone(x, y, dz = .16) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var prevInteract = false;
function sampleActions() {
	let steer = 0;
	let throttle = 0;
	if (isDown("KeyA") || isDown("ArrowLeft")) steer += 1;
	if (isDown("KeyD") || isDown("ArrowRight")) steer -= 1;
	if (isDown("KeyW") || isDown("ArrowUp")) throttle += 1;
	if (isDown("KeyS") || isDown("ArrowDown")) throttle -= 1;
	steer += -touchSteer.x;
	throttle += touchSteer.y;
	const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
	if (pads) for (const pad of pads) {
		if (!pad || pad.mapping !== "standard") continue;
		const stick = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
		steer += -stick.x;
		throttle += -stick.y;
		if (pad.buttons[14]?.pressed) steer += 1;
		if (pad.buttons[15]?.pressed) steer -= 1;
		if (pad.buttons[12]?.pressed) throttle += 1;
		if (pad.buttons[13]?.pressed) throttle -= 1;
	}
	steer = Math.max(-1, Math.min(1, steer));
	throttle = Math.max(-1, Math.min(1, throttle));
	const interact = isDown("KeyE") || isDown("Space") || Boolean(pads?.[0]?.buttons[0]?.pressed);
	const interactPressed = interact && !prevInteract;
	prevInteract = interact;
	return {
		throttle,
		steer,
		interact,
		interactPressed
	};
}
var savedTime = (() => {
	if (typeof localStorage === "undefined") return 9.25;
	const n = Number(localStorage.getItem("willowmere-hour"));
	return Number.isFinite(n) ? n : 9.25;
})();
var useGardenStore = create((set, get) => ({
	playing: false,
	cameraMode: "follow",
	timeOfDay: savedTime,
	autoTime: false,
	seated: false,
	flowersPicked: 0,
	pickedBeds: [],
	hint: null,
	nearby: null,
	enter: () => set({
		playing: true,
		seated: false
	}),
	setCameraMode: (cameraMode) => set({
		cameraMode,
		seated: false
	}),
	setTimeOfDay: (timeOfDay) => {
		set({ timeOfDay });
		try {
			localStorage.setItem("willowmere-hour", String(timeOfDay));
		} catch {}
	},
	setAutoTime: (autoTime) => set({ autoTime }),
	setSeated: (seated) => set({ seated }),
	pickBed: (id) => {
		const { pickedBeds } = get();
		if (pickedBeds.includes(id)) return;
		set({
			pickedBeds: [...pickedBeds, id],
			flowersPicked: get().flowersPicked + 3 + Math.floor(Math.random() * 3),
			hint: "You gathered a small handful of blooms."
		});
	},
	setHint: (hint) => set({ hint }),
	setNearby: (nearby) => set({ nearby })
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground hover:opacity-90",
			ghost: "bg-transparent text-fg hover:bg-surface-2",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2"
		},
		size: {
			md: "h-11 rounded-md px-5 text-sm",
			lg: "h-12 rounded-md px-6 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function TouchJoystick() {
	const root = (0, import_react.useRef)(null);
	const setFromEvent = (clientX, clientY) => {
		const el = root.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const nx = (clientX - cx) / (rect.width * .5);
		const ny = (cy - clientY) / (rect.height * .5);
		const m = Math.hypot(nx, ny);
		const k = m > 1 ? 1 / m : 1;
		touchSteer.x = nx * k;
		touchSteer.y = ny * k;
	};
	const clear = () => {
		touchSteer.x = 0;
		touchSteer.y = 0;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: root,
		className: "pointer-events-auto relative size-[112px] rounded-full border border-border bg-surface/70",
		onPointerDown: (e) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			setFromEvent(e.clientX, e.clientY);
		},
		onPointerMove: (e) => {
			if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
			setFromEvent(e.clientX, e.clientY);
		},
		onPointerUp: clear,
		onPointerCancel: clear,
		"aria-label": "Walk",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute size-11 rounded-full bg-primary/90",
			style: {
				left: `calc(50% + ${touchSteer.x * 28}px)`,
				top: `calc(50% + ${-touchSteer.y * 28}px)`,
				transform: "translate(-50%, -50%)"
			}
		})
	});
}
function GardenOverlay() {
	const playing = useGardenStore((s) => s.playing);
	const enter = useGardenStore((s) => s.enter);
	const cameraMode = useGardenStore((s) => s.cameraMode);
	const setCameraMode = useGardenStore((s) => s.setCameraMode);
	const timeOfDay = useGardenStore((s) => s.timeOfDay);
	const setTimeOfDay = useGardenStore((s) => s.setTimeOfDay);
	const autoTime = useGardenStore((s) => s.autoTime);
	const setAutoTime = useGardenStore((s) => s.setAutoTime);
	const hint = useGardenStore((s) => s.hint);
	const flowers = useGardenStore((s) => s.flowersPicked);
	const seated = useGardenStore((s) => s.seated);
	const hourLabel = formatHour(timeOfDay);
	const onInteract = () => {
		window.dispatchEvent(new KeyboardEvent("keydown", {
			code: "KeyE",
			key: "e"
		}));
		window.setTimeout(() => {
			window.dispatchEvent(new KeyboardEvent("keyup", {
				code: "KeyE",
				key: "e"
			}));
		}, 90);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 text-fg",
		children: [!playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto flex h-full flex-col items-center justify-end bg-bg/35 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16 sm:justify-center sm:pb-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-xl border border-border bg-bg/80 px-6 py-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-muted uppercase",
						children: "Lakeside garden"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl leading-tight tracking-[-0.03em] italic",
						children: "Willowmere"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-muted",
						children: "Walk the path around the lake. Sit a while. The willows lean, the ducks paddle, and the sky keeps its own hours."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: enter,
							className: "w-full sm:w-auto",
							children: "Enter garden"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "W S walk · A D turn · E interact"
						})]
					})
				]
			})
		}), playing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-auto absolute top-0 right-0 left-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg tracking-[-0.03em] italic",
					children: "Willowmere"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: hourLabel
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex h-11 items-center gap-2 rounded-md border border-border bg-bg/70 px-3 text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flower2, { className: "size-4 text-sage" }), flowers]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						"aria-label": cameraMode === "follow" ? "Look around" : "Walk",
						onClick: () => setCameraMode(cameraMode === "follow" ? "orbit" : "follow"),
						children: cameraMode === "follow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footprints, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto absolute top-20 right-4 left-4 flex max-w-56 flex-col gap-2 rounded-lg border border-border bg-bg/70 p-3 max-sm:ml-auto sm:left-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "size-3.5" }), "Hour"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-fg",
							children: hourLabel
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 24,
						step: .1,
						value: timeOfDay,
						onChange: (e) => setTimeOfDay(Number(e.target.value)),
						className: "w-full accent-primary",
						"aria-label": "Time of day"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left text-xs text-muted hover:text-fg",
						onClick: () => setAutoTime(!autoTime),
						children: autoTime ? "Pause the sky" : "Let the day drift"
					})
				]
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-28 left-1/2 max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-md border border-border bg-bg/75 px-3 py-2 text-center text-sm text-fg sm:bottom-8",
				children: hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto absolute right-0 bottom-0 left-0 flex items-end justify-between gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchJoystick, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					"aria-label": "Sit or gather",
					onClick: onInteract,
					children: seated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footprints, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flower2, {})
				})]
			})
		] })]
	});
}
function formatHour(h) {
	const wrapped = (h % 24 + 24) % 24;
	const hr = Math.floor(wrapped);
	const min = Math.round((wrapped - hr) * 60) % 60;
	const hh = hr % 12 === 0 ? 12 : hr % 12;
	const ap = hr < 12 ? "AM" : "PM";
	return `${hh}:${min.toString().padStart(2, "0")} ${ap}`;
}
var GardenCanvas = (0, import_react.lazy)(() => import("./GardenCanvas-BwhJ-R5c.mjs"));
function GardenApp() {
	const [client, setClient] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setClient(true);
		return bindGardenInput();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [client ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg" }),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GardenCanvas, {})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GardenOverlay, {})]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GardenApp, {});
}
//#endregion
export { setInjectedKeys as a, sampleActions as i, useGardenStore as n, lookState as r, routes_exports as t };
