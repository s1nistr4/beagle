import { Hono } from "hono"

class App {
 public static main():void {
  const app:Hono = new Hono()

  app.get("/", (c):void => {
  })
 }
}

App.main()
