// src/app/api/jobs/route.ts
import { connectToDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDB();

    const role = session.user.role;
    let jobs;

    if (role === 'admin') {
      jobs = await Job.find({}).sort({ createdAt: -1 });
    } else {
      jobs = await Job.find({
        $or: [{ status: 'pending' }, { status: 'in_progress', assignedTo: session.user.email }],
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
