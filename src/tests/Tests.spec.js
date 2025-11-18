import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import http from "k6/http";
import { check } from "k6";
import { Trend, Rate } from "k6/metrics";

export const durationGetUsers = new Trend("duration_get_users", true);
export const successRate = new Rate("success_rate_users");

export const options = {
  thresholds: {
    http_req_failed: ["rate<0.25"],
    duration_get_users: ["p(90)<6800"],
  },
  stages: [
    { duration: "1m", target: 7 },
    { duration: "1m", target: 92 },
    { duration: "1m30s", target: 92 },
  ],
};

const USERS_API = "https://gorest.co.in/public/v2/users";
const STATUS_OK = 200;

export default function () {
  const requestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.get(USERS_API, requestConfig);

  durationGetUsers.add(response.timings.duration);
  successRate.add(response.status === STATUS_OK);

  check(response, {
    "Users endpoint respondeu com 200": () => response.status === STATUS_OK,
  });
}

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
