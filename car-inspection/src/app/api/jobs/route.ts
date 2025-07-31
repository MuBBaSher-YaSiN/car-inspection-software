// src/app/api/jobs/route.ts
import { connectToDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const newJob = await Job.create(body);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Job creation failed' }, { status: 500 });
  }
}
