import { writable } from "svelte/store"
import type { Writable } from "svelte/store"

const Demo:Writable<boolean> = writable<boolean>(0)

export { Demo }
