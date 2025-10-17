# Publishing Guide

This guide explains how to publish the `@mobilehisaab/react-native-tabview` package to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **Login to npm**: Run `npm login` in your terminal
3. **Verify package name**: Ensure the package name `@mobilehisaab/react-native-tabview` is available

## Pre-publish Checklist

### 1. Build the Package

```bash
cd tabview-package
npm run build
```

### 2. Test the Package

```bash
# Test in example app
cd example
npm install
npm run android  # or npm run ios
```

### 3. Update Version

```bash
# Update version in package.json
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

### 4. Verify Package Contents

```bash
npm pack --dry-run
```

This will show what files will be included in the package.

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

### 2. Publish the Package

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages.

### 3. Verify Publication

```bash
npm view @mobilehisaab/react-native-tabview
```

## Post-Publish

### 1. Create Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Update Documentation

- Update README.md with any new features
- Update CHANGELOG.md with version changes
- Update example app if needed

### 3. Test Installation

```bash
# Test in a new project
npx react-native init TestApp
cd TestApp
npm install @mobilehisaab/react-native-tabview
```

## Troubleshooting

### Common Issues

1. **Package name already exists**

   - Change the package name in `package.json`
   - Update all references to the new name

2. **Authentication failed**

   - Run `npm login` again
   - Check if you have 2FA enabled

3. **Build errors**

   - Run `npm run build` to check for TypeScript errors
   - Fix any compilation issues

4. **Missing dependencies**
   - Ensure all peer dependencies are listed
   - Check that all imports are correct

### Rollback

If you need to unpublish (within 24 hours):

```bash
npm unpublish @mobilehisaab/react-native-tabview@1.0.0
```

## Version Management

### Semantic Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Pre-release Versions

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

## Package Maintenance

### Regular Updates

1. Monitor for issues on GitHub
2. Update dependencies regularly
3. Test with latest React Native versions
4. Update documentation as needed

### Security Updates

1. Run `npm audit` regularly
2. Update vulnerable dependencies
3. Publish security patches promptly

## Support

For publishing issues:

- Check [npm documentation](https://docs.npmjs.com/)
- Contact npm support if needed
- Check package status at [npmjs.com](https://www.npmjs.com)
