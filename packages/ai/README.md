# @azmr/ai

AI-powered code analysis and auto-fix system running inside a true V8 isolate sandbox via isolated-vm.

## Features
- Safe code execution in isolated VM contexts
- AI-powered code analysis and transformation  
- Secure sandboxing (not the deprecated vm2)
- TypeScript-first API

## Installation
```bash
npm install @azmr/ai
```

## Usage
```typescript
import { aiFix } from '@azmr/ai';

const fixedCode = aiFix('function test() { return x; }');
console.log(fixedCode);
// Outputs: function test() { return x; }
```

## API
### `aiFix(code: string): string`
Analyzes and fixes JavaScript/TypeScript code using AI inside a secure sandbox.

## Security
- Runs in true V8 isolate via isolated-vm
- No access to host filesystem or network
- Resource-limited execution environment

## License
MIT
EOF