'use client';
import { Spin } from 'antd';

export default function RootLoading() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.6)',
                zIndex: 99997,
                pointerEvents: 'none',
            }}
            aria-hidden
        >
            <Spin size="large" />
        </div>
    );
}


