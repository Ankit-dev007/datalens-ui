import DataSubjectDetailsClient from './DataSubjectDetailsClient';

export async function generateStaticParams() {
    try {
        const res = await fetch('http://localhost:5000/api/data-subjects');
        const subjects = await res.json();
        return subjects.map((subject: any) => ({
            id: subject.id,
        }));
    } catch (error) {
        console.warn('Failed to generate static params for data-subjects:', error);
        return [];
    }
}

export default async function DataSubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DataSubjectDetailsClient id={id} />;
}
