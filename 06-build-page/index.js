const path = require('path');
const fs = require('fs/promises');
const root = path.join(__dirname);
const templatePath = path.join(root, 'template.html');
const stylesPath = path.join(root, 'styles');
const assetsPath = path.join(root, 'assets');
const createReadStream = require('fs').createReadStream;
const createWriteStream = require('fs').createWriteStream;

bundle();
async function bundle() {
  try {
    await fs.mkdir(path.join(root, 'project-dist'));
  } catch (err) {
    if (err.code === 'EEXIST') {
      await deleteAll(path.join(root, 'project-dist'));
    } else {
      throw err;
    }
  }

  const assets = await fs.readdir(assetsPath, { withFileTypes: true });
  const distDir = path.join(root, 'project-dist');
  await fs.mkdir(path.join(distDir, 'assets'));
  const assetsDistPath = path.join(distDir, 'assets');
  console.log('Directory made');
  await makeIndex(distDir);
  await copyAssets(distDir, assets, assetsDistPath);
  await bundleStyles(distDir);
}

async function getTemplate() {
  const readStream = createReadStream(templatePath, 'utf-8');
  console.log('Got template');
  return readStream;
}

async function makeIndex(whenCreate) {
  const template = await getTemplate();
  let templateContent = '';
  const ws = await createWriteStream(path.join(whenCreate, 'index.html'));
  template.on('data', (chunk) => {
    templateContent += chunk;
  });

  template.on('end', async () => {
    templateContent = await replacePlaceholders(templateContent);
    ws.write(templateContent);
  });
}

async function replacePlaceholders(templateContent) {
  const pattern = /\{\{([^}]+)\}\}/g;
  const spaces = countSpaces(templateContent);
  templateContent = templateContent
    .split('\n')
    .reduce((result, item) => {
      if (item.includes('>{{')) {
        let parts = item.split(/>(?={)|}(?=<)/g);
        parts.forEach((part, partIndex) => {
          if (partIndex === 0) {
            result.push(part);
          } else {
            if (part[0] === '{') {
              result[result.length - 1] += `>\n ${spaces.articles}${part}}`;
            } else {
              result[result.length - 1] += `${part}`;
            }
          }
        });
      } else {
        result.push(item);
      }
      return result;
    }, [])
    .join('\n');
  let match;
  while ((match = pattern.exec(templateContent)) !== null) {
    const placeHolder = match[0];
    const placeHolderName = match[1];
    const replacement = (await loadReplacement(placeHolderName))
      .split('\n')
      .map((item, index) => {
        if (index > 0) {
          return spaces[placeHolderName] + item;
        } else {
          return item;
        }
      })
      .join('\n');
    templateContent = templateContent.replace(placeHolder, replacement);
    console.log(placeHolderName + ' replaced');
  }
  return templateContent.replace('}', '');
}

async function loadReplacement(placeHolderName) {
  try {
    return await fs.readFile(
      path.join(root, 'components', `${placeHolderName}.html`),
      'utf-8',
    );
  } catch (err) {
    throw new Error(`!!!THIS IS CUSTOM ERROR MESSAGE! In template.html you use wrong tag {{${placeHolderName}}}!!!\n 
      or please, insert file ${placeHolderName} into components folder!`);
  }
}

function countSpaces(code) {
  const patternIn = '{{';
  const lines = code.split('\n');
  let spacesCount = {};
  for (let line of lines) {
    if (line.includes(patternIn)) {
      spacesCount[checkLine(line)[0]] = '';
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '{' || line[i] !== ' ') {
          break;
        }
        spacesCount[checkLine(line)[0]] += line[i];
      }
    }
  }
  return spacesCount;
}

function checkLine(line) {
  let regex = /{{\s*([^}\s]+)\s*}}/g;
  let matches = line.match(regex);
  if (matches) {
    let values = matches.map((match) => match.match(/{{\s*([^}\s]+)\s*}}/)[1]);
    return values;
  }
}

async function bundleStyles(stylesDist) {
  const styles = await fs.readdir(stylesPath, { withFileTypes: true });
  const ws = createWriteStream(path.join(stylesDist, 'style.css'));
  for (const style of styles) {
    const styleRead = createReadStream(path.join(stylesPath, style.name));
    if (style.isFile() && style.name.split('.')[1] === 'css') {
      styleRead.on('data', (chunk) => {
        ws.write(chunk + '\n');
      });
      styleRead.on('end', () => {
        console.log(`${style.name} bundled in style.css`);
      });
    }
  }
}

async function copyAssets(distDir, assets, assetsDistPath) {
  for (const asset of assets) {
    if (asset.isDirectory()) {
      const unDir = await fs.readdir(path.join(assetsPath, asset.name), {
        withFileTypes: true,
      });
      await fs.mkdir(path.join(assetsDistPath, asset.name), {
        recursive: true,
      });
      const unDistPath = path.join(assetsDistPath, asset.name);
      const unPath = path.join(assetsPath, asset.name);
      await copyAssets(unPath, unDir, unDistPath);
    } else {
      await fs.copyFile(
        path.join(distDir, asset.name),
        path.join(assetsDistPath, asset.name),
      );
    }
  }
}
async function deleteAll(destPath) {
  console.log('Begin rebuilding process');
  try {
    const filesDest = await fs.readdir(destPath, { withFileTypes: true });
    for (const file of filesDest) {
      const filePath = path.join(destPath, file.name);
      if (file.isDirectory()) {
        await deleteAll(filePath);
        await fs.rmdir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}
