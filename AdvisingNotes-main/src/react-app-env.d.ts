/// <reference types="react-scripts" />

// React declarations
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
  }
  export interface SVGProps<T> {
    className?: string;
    color?: string;
    height?: number | string;
    id?: string;
    stroke?: string | number;
    strokeWidth?: number | string;
    style?: any;
    width?: number | string;
    size?: number | string;
  }
  export type ReactElement = any;
}

declare module 'react/jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
    li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    [elemName: string]: any; // Allow any other elements
  }
}

declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps {
    size?: string | number;
    color?: string;
    stroke?: string | number;
    strokeWidth?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }
  
  export type Icon = React.FC<LucideProps>;
  
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

declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    constructor(options?: {orientation?: string, unit?: string, format?: string});
    internal: any;
    addPage(): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    text(text: string | string[], x: number, y: number, options?: {align?: string}): jsPDF;
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
    setPage(pageNumber: number): jsPDF;
  }
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    logging?: boolean;
    allowTaint?: boolean;
    useCORS?: boolean;
    imageTimeout?: number;
    [key: string]: any;
  }
  export default function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}
