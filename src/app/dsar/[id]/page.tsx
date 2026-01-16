import DSARDetailsClient from './DSARDetailsClient';

export async function generateStaticParams() {
    try {
        const res = await fetch('http://localhost:5000/api/dsar');
        const requests = await res.json();
        return requests.map((req: any) => ({
            id: req.id,
        }));
    } catch (error) {
        console.warn('Failed to generate static params for dsar:', error);
        return [];
    }
}

export default async function DSARDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DSARDetailsClient id={id} />;
}
