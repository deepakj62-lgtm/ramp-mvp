import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Plain text
    if (fileName.endsWith('.txt')) {
      return NextResponse.json({ text: buffer.toString('utf-8') });
    }

    // PDF
    if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text });
    }

    // Word (.docx or .doc)
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }

    return NextResponse.json({ error: 'Unsupported file type. Use .txt, .pdf, .docx, or .doc' }, { status: 400 });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 });
  }
}
