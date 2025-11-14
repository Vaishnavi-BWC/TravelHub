const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Comprehensive Code Quality Reports...\n');

// Create reports directory
const reportsDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

try {
  console.log('📝 1. Running ESLint Analysis...');
  execSync('npx eslint src/ --format html > reports/eslint-report.html', { stdio: 'inherit' });
  execSync('npx eslint src/ --format json > reports/eslint-report.json', { stdio: 'inherit' });
  
  // Generate ESLint summary
  const eslintOutput = execSync('npx eslint src/ --format stylish', { encoding: 'utf8' });
  fs.writeFileSync('reports/eslint-summary.txt', eslintOutput);

  console.log('🧪 2. Generating Test Coverage Report...');
  execSync('npm test -- --coverage --watchAll=false --silent', { stdio: 'inherit' });
  
  console.log('📦 3. Analyzing Bundle Size...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    // Generate bundle report
    execSync('npx webpack-bundle-analyzer build/static/js/*.js -r reports/bundle-analysis.html', { stdio: 'inherit' });
  } catch (buildError) {
    console.log('⚠️  Build failed, skipping bundle analysis');
  }

  console.log('📊 4. Generating Project Metrics...');
  const srcFiles = countFiles(path.join(process.cwd(), 'src'));
  const components = countComponents(path.join(process.cwd(), 'src'));
  
  const metricsReport = `
# CODE QUALITY REPORT
Generated: ${new Date().toLocaleString()}

## Project Metrics:
- Total Source Files: ${srcFiles.total}
- React Components: ${components.total}
- Components with PropTypes: ${components.withPropTypes}
- Components with Tests: ${await countTestedComponents()}

## Available Reports:
- 📊 ESLint HTML Report: file://${path.join(reportsDir, 'eslint-report.html')}
- 📈 Test Coverage: file://${path.join(process.cwd(), 'coverage/lcov-report/index.html')}
- 📦 Bundle Analysis: file://${path.join(reportsDir, 'bundle-analysis.html')}
- 📋 ESLint Summary: ${path.join(reportsDir, 'eslint-summary.txt')}

## Quick Commands:
npm run lint:report    # Update ESLint reports
npm run lint:fix       # Auto-fix ESLint issues
npm run coverage:report # Update test coverage
  `;
  
  fs.writeFileSync('reports/QUALITY_REPORT.md', metricsReport);
  
  console.log('\n✅ ALL QUALITY REPORTS GENERATED SUCCESSFULLY!');
  console.log('==========================================');
  console.log('📁 Open: reports/eslint-report.html');
  console.log('📁 Open: coverage/lcov-report/index.html');
  console.log('📁 Open: reports/bundle-analysis.html');
  console.log('📋 Summary: reports/QUALITY_REPORT.md');
  console.log('\n🚨 Check reports/eslint-summary.txt for issues to fix');
  
} catch (error) {
  console.error('❌ Error generating reports:', error.message);
}

// Helper functions
function countFiles(dir) {
  try {
    const files = fs.readdirSync(dir, { recursive: true });
    const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx'));
    return { total: files.length, jsFiles: jsFiles.length };
  } catch {
    return { total: 0, jsFiles: 0 };
  }
}

function countComponents(dir) {
  try {
    const files = fs.readdirSync(dir, { recursive: true });
    const componentFiles = files.filter(f => 
      (f.endsWith('.js') || f.endsWith('.jsx')) && 
      !f.includes('.test.') && 
      !f.includes('.spec.')
    );
    
    let withPropTypes = 0;
    componentFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        if (content.includes('PropTypes') || content.includes('interface Props')) {
          withPropTypes++;
        }
      } catch (e) {}
    });
    
    return { total: componentFiles.length, withPropTypes };
  } catch {
    return { total: 0, withPropTypes: 0 };
  }
}

async function countTestedComponents() {
  try {
    const testFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true })
      .filter(f => f.includes('.test.') || f.includes('.spec.'));
    return testFiles.length;
  } catch {
    return 0;
  }
}