import { NextResponse } from "next/server";

// CORS headers helper function
const corsHeaders = (origin: string) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://yourdomain.com'];
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '';
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || '';
  
  return NextResponse.json(
    { status: "ok", message: "API is working" },
    { headers: corsHeaders(origin) }
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '';
  
  try {
    const data = await request.json();
    return NextResponse.json(
      { 
        status: "ok", 
        message: "POST request received", 
        receivedData: data 
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { 
        status: 400,
        headers: corsHeaders(origin)
      }
    );
  }
} 