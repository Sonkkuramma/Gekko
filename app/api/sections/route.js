
const SectionRepository = require('../../lib/repositories/sectionRepository');

export async function GET() {
  const repository = new SectionRepository();
  try {
    const items = await repository.findAll();
    return Response.json(items);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const repository = new SectionRepository();
  try {
    const data = await request.json();
    const newItem = await repository.create(data);
    return Response.json(newItem, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
