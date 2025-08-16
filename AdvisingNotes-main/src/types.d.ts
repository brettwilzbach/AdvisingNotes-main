// Global type declarations
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
}

declare module 'react/jsx-runtime';

declare module 'lucide-react' {
  import * as React from 'react';
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    stroke?: string | number;
  }
  type Icon = React.FC<IconProps>;
  
  export const PlusCircle: Icon;
  export const Trash2: Icon;
  export const FilePlus: Icon;
  export const FileText: Icon;
  export const Clock: Icon;
  export const Users: Icon;
  export const ChevronLeft: Icon;
  export const GraduationCap: Icon;
  export const FileDown: Icon;
  export const Plus: Icon;
  export const Check: Icon;
  export const Database: Icon;
}

declare module 'html2canvas' {
  export default function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: {orientation?: string, unit?: string, format?: string});
    internal: any;
    addPage(): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    addImage(imageData: any, format: string, x: number, y: number, width: number, height: number, alias?: string, compression?: string, rotation?: number): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    save(filename: string): jsPDF;
    output(type: string, options?: any): any;
    setFillColor(r: number, g: number, b: number): jsPDF;
    rect(x: number, y: number, w: number, h: number, style: string): jsPDF;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style: string): jsPDF;
    setDrawColor(r: number, g: number, b: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    splitTextToSize(text: string, maxWidth: number): string[];
  }
}
