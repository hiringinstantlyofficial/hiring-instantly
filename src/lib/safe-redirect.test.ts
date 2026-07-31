import { describe, expect, it } from "vitest";

import { safeAdminRedirect } from "@/lib/safe-redirect";

describe("safeAdminRedirect", () => {
  it("allows the admin root and paths beneath it", () => {
    expect(safeAdminRedirect("/admin")).toBe("/admin");
    expect(safeAdminRedirect("/admin/jobs")).toBe("/admin/jobs");
    expect(safeAdminRedirect("/admin/jobs/new")).toBe("/admin/jobs/new");
  });

  it("preserves the query string and fragment", () => {
    expect(safeAdminRedirect("/admin/jobs?status=draft")).toBe(
      "/admin/jobs?status=draft",
    );
    expect(safeAdminRedirect("/admin/jobs#row-3")).toBe("/admin/jobs#row-3");
  });

  it("falls back when nothing was requested", () => {
    expect(safeAdminRedirect(null)).toBe("/admin");
    expect(safeAdminRedirect(undefined)).toBe("/admin");
    expect(safeAdminRedirect("")).toBe("/admin");
  });

  // --- the open-redirect cases the old startsWith("/admin") check let through
  it("rejects a host that merely starts with the admin prefix", () => {
    expect(safeAdminRedirect("/admin@evil.com")).toBe("/admin");
    expect(safeAdminRedirect("/administrator-evil")).toBe("/admin");
  });

  it("rejects traversal out of the admin area", () => {
    expect(safeAdminRedirect("/admin/../../evil-path")).toBe("/admin");
    expect(safeAdminRedirect("/admin/..%2f..%2fevil")).toBe("/admin");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeAdminRedirect("//evil.com")).toBe("/admin");
    expect(safeAdminRedirect("//evil.com/admin")).toBe("/admin");
    expect(safeAdminRedirect("https://evil.com/admin")).toBe("/admin");
    expect(safeAdminRedirect("http://evil.com")).toBe("/admin");
  });

  it("rejects backslash variants browsers normalise to slashes", () => {
    expect(safeAdminRedirect("/\\evil.com")).toBe("/admin");
    expect(safeAdminRedirect("/admin\\..\\evil")).toBe("/admin");
  });

  it("rejects non-http schemes", () => {
    expect(safeAdminRedirect("javascript:alert(1)")).toBe("/admin");
    expect(safeAdminRedirect("data:text/html,<script>")).toBe("/admin");
  });

  it("rejects embedded control characters", () => {
    expect(safeAdminRedirect("/admin\nSet-Cookie: x=1")).toBe("/admin");
    expect(safeAdminRedirect("/ad\tmin")).toBe("/admin");
  });

  it("rejects a relative path that does not start at the root", () => {
    expect(safeAdminRedirect("admin/jobs")).toBe("/admin");
    expect(safeAdminRedirect("../admin")).toBe("/admin");
  });
});
