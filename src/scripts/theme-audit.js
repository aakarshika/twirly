const fs = require('fs');
const path = require('path');

const componentsToCheck = [
  // Layout Components
  'src/components/layout/Footer.jsx',
  'src/components/layout/MainLayout.jsx',

  // Common Components
  'src/components/common/Button.jsx',
  'src/components/common/Card.jsx',
  'src/components/common/Input.jsx',
  'src/components/common/Modal.jsx',
  'src/components/common/Dropdown.jsx',

  // Comparison Components
  'src/components/comparison/ComparisonList.jsx',
  'src/components/comparison/ComparisonCard.jsx',
  'src/components/comparison/ItemCard.jsx',
  'src/components/comparison/VoteButton.jsx',
  'src/components/comparison/ComparisonStats.jsx',

  // Review Components
  'src/components/reviews/ReviewSection.jsx',
  'src/components/reviews/ReviewList.jsx',
  'src/components/reviews/ReviewCard.jsx',
  'src/components/reviews/ReviewMetrics.jsx',

  // Profile Components
  'src/components/profile/UserInfo.jsx',
  'src/components/profile/UserStats.jsx',
  'src/components/profile/ActivityTabs.jsx',
  'src/components/profile/SettingsPanel.jsx',

  // Company Components
  'src/components/company/CompanyHeader.jsx',
  'src/components/company/CompanyInfo.jsx',
  'src/components/company/ProductGrid.jsx',
  'src/components/company/ProductCard.jsx',
];

const colorPatterns = [
  /#[0-9a-fA-F]{3,6}/, // Hex colors
  /rgb\(.*?\)/, // RGB colors
  /rgba\(.*?\)/, // RGBA colors
  /hsl\(.*?\)/, // HSL colors
  /hsla\(.*?\)/, // HSLA colors
  /bg-.*?-\d{1,3}/, // Tailwind background colors
  /text-.*?-\d{1,3}/, // Tailwind text colors
  /border-.*?-\d{1,3}/, // Tailwind border colors
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for hardcoded colors
    colorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'hardcoded-color',
          colors: matches,
        });
      }
    });

    // Check for theme context usage
    const usesThemeContext = content.includes('useTheme');
    if (!usesThemeContext) {
      issues.push({
        type: 'missing-theme-context',
      });
    }

    // Check for CSS variable usage
    const usesCssVariables = content.includes('var(--color-');
    if (!usesCssVariables) {
      issues.push({
        type: 'missing-css-variables',
      });
    }

    return {
      file: filePath,
      exists: true,
      issues,
    };
  } catch (error) {
    return {
      file: filePath,
      exists: false,
      error: error.message,
    };
  }
}

function generateReport() {
  const report = {
    totalComponents: componentsToCheck.length,
    checkedComponents: [],
    summary: {
      missingFiles: 0,
      componentsWithIssues: 0,
      totalIssues: 0,
    },
  };

  componentsToCheck.forEach(filePath => {
    const result = checkFile(filePath);
    report.checkedComponents.push(result);

    if (!result.exists) {
      report.summary.missingFiles++;
    } else if (result.issues.length > 0) {
      report.summary.componentsWithIssues++;
      report.summary.totalIssues += result.issues.length;
    }
  });

  return report;
}

function printReport(report) {
  console.log('\nTheme Support Audit Report\n');
  console.log(`Total Components: ${report.totalComponents}`);
  console.log(`Missing Files: ${report.summary.missingFiles}`);
  console.log(`Components with Issues: ${report.summary.componentsWithIssues}`);
  console.log(`Total Issues Found: ${report.summary.totalIssues}\n`);

  console.log('Detailed Report:\n');
  report.checkedComponents.forEach(component => {
    console.log(`\nFile: ${component.file}`);
    if (!component.exists) {
      console.log('  ❌ File does not exist');
    } else if (component.issues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      component.issues.forEach(issue => {
        if (issue.type === 'hardcoded-color') {
          console.log(`  ⚠️ Hardcoded colors found: ${issue.colors.join(', ')}`);
        } else if (issue.type === 'missing-theme-context') {
          console.log('  ⚠️ Theme context not used');
        } else if (issue.type === 'missing-css-variables') {
          console.log('  ⚠️ CSS variables not used');
        }
      });
    }
  });
}

// Run the audit
const report = generateReport();
printReport(report); 