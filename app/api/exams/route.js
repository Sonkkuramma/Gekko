
const ExamRepository = require('../../lib/repositories/examRepository');

export async function GET() {
  const repository = new ExamRepository();
  try {
    const items = await repository.findAll();
    return Response.json(items);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const repository = new ExamRepository();
  try {
    const data = await request.json();
    const newItem = await repository.create(data);
    return Response.json(newItem, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
