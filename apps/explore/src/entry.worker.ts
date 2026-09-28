/**
 * Cloudflare Worker entry.
 *
 * Qwik City 1.x only ships a Cloudflare Pages adapter, so this small entry
 * connects Qwik City's platform-neutral request handler to a Workers fetch
 * handler instead. Static files are served by Workers static assets before
 * this code runs.
 */
import {
  mergeHeadersCookies,
  requestHandler,
  type ServerRequestEvent,
} from "@builder.io/qwik-city/middleware/request-handler";
import {
  _deserializeData,
  _serializeData,
  _verifySerializable,
} from "@builder.io/qwik";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

export interface Env {
  ASSETS: Fetcher;
}

interface Platform {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}

declare global {
  type QwikCityPlatform = Platform;
}

const qwikSerializer = {
  _deserializeData,
  _serializeData,
  _verifySerializable,
};

export default {
  async fetch(request, env, ctx) {
    try {
      const serverRequestEv: ServerRequestEvent<Response> = {
        mode: "server",
        locale: undefined,
        url: new URL(request.url),
        request,
        env: { get: (key) => (env as unknown as Record<string, string>)[key] },
        getWritableStream: (status, headers, cookies, resolve) => {
          const { readable, writable } = new TransformStream();
          resolve(
            new Response(readable, {
              status,
              headers: mergeHeadersCookies(headers, cookies),
            }),
          );
          return writable;
        },
        getClientConn: () => ({
          ip: request.headers.get("cf-connecting-ip") ?? "",
          country: request.headers.get("cf-ipcountry") ?? "",
        }),
        platform: { request, env, ctx } satisfies Platform,
      };

      const handled = await requestHandler(
        serverRequestEv,
        { render, qwikCityPlan },
        qwikSerializer,
      );
      if (handled) {
        handled.completion.then((err) => err && console.error(err));
        const response = await handled.response;
        if (response) return response;
      }

      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain;charset=UTF-8" },
      });
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain;charset=UTF-8" },
      });
    }
  },
} satisfies ExportedHandler<Env>;
