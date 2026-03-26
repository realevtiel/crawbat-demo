import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("test_widget_auth")?.value;

  if (token === process.env.TEST_PAGE_PASSWORD) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/test-widget/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/test-widget",
};
