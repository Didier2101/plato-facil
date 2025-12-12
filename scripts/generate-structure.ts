// scripts/generate-structure.ts
// Ejecutar con: npx tsx scripts/generate-structure.ts

import * as fs from 'fs';
import * as path from 'path';

interface TreeOptions {
    ignoreDirs: string[];
    ignoreFiles: string[];
    maxDepth?: number;
    showFiles?: boolean;
}

const DEFAULT_OPTIONS: TreeOptions = {
    ignoreDirs: [
        'node_modules',
        '.next',
        '.git',
        'dist',
        'build',
        '.vercel',
        'out',
        'coverage',
        '.turbo',
    ],
    ignoreFiles: [
        '.DS_Store',
        '.env.local',
        '.env',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
    ],
    maxDepth: 10,
    showFiles: true,
};

function shouldIgnore(name: string, options: TreeOptions, isDirectory: boolean): boolean {
    if (isDirectory) {
        return options.ignoreDirs.includes(name);
    }
    return options.ignoreFiles.includes(name);
}

function generateTree(
    dir: string,
    prefix: string = '',
    depth: number = 0,
    options: TreeOptions = DEFAULT_OPTIONS
): string {
    if (options.maxDepth && depth > options.maxDepth) {
        return '';
    }

    let output = '';

    try {
        const items = fs.readdirSync(dir);
        const filtered = items.filter((item) => {
            const itemPath = path.join(dir, item);
            const isDirectory = fs.statSync(itemPath).isDirectory();
            return !shouldIgnore(item, options, isDirectory);
        });

        // Separar directorios y archivos
        const directories = filtered.filter((item) => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        const files = options.showFiles
            ? filtered.filter((item) => {
                const itemPath = path.join(dir, item);
                return !fs.statSync(itemPath).isDirectory();
            })
            : [];

        const allItems = [...directories.sort(), ...files.sort()];

        allItems.forEach((item, index) => {
            const isLast = index === allItems.length - 1;
            const itemPath = path.join(dir, item);
            const isDirectory = fs.statSync(itemPath).isDirectory();

            const connector = isLast ? '└── ' : '├── ';
            const icon = isDirectory ? '📁 ' : '📄 ';

            output += `${prefix}${connector}${icon}${item}\n`;

            if (isDirectory) {
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                output += generateTree(itemPath, newPrefix, depth + 1, options);
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            output += `${prefix}[Error: ${error.message}]\n`;
        }
    }

    return output;
}

function generateStructure(): void {
    const projectRoot = process.cwd();
    const projectName = path.basename(projectRoot);

    console.log('🚀 Generando estructura del proyecto...\n');

    const tree = `${projectName}/\n${generateTree(projectRoot)}`;

    // Guardar en archivo
    const outputPath = path.join(projectRoot, 'PROJECT_STRUCTURE.md');
    const content = `# Estructura del Proyecto

Generado el: ${new Date().toLocaleString('es-CO')}

\`\`\`
${tree}
\`\`\`

## Descripción de Directorios Principales

### \`/app\`
Directorio principal de Next.js 15 App Router. Contiene todas las rutas y layouts de la aplicación.

### \`/components\`
Componentes React reutilizables organizados por funcionalidad.

### \`/lib\`
Utilidades, helpers, y configuraciones (Supabase client, etc.).

### \`/types\`
Definiciones de tipos TypeScript para la aplicación.

### \`/hooks\`
Custom hooks de React.

### \`/utils\`
Funciones de utilidad y helpers.

### \`/public\`
Archivos estáticos (imágenes, fonts, etc.).

### \`/styles\`
Archivos de estilos globales (si los hay).
`;

    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(tree);
    console.log(`\n✅ Estructura guardada en: ${outputPath}`);
}

// Ejecutar
generateStructure();