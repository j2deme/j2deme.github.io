import { readFileSync, readdirSync, writeFileSync } from "fs";

import dayjs from "dayjs";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { join } from "path";
import slugify from "slugify";
import v from "voca";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

const draftPath = join(__dirname, "../src/content/blog/post-template.md");
const blogPath = join(__dirname, "../src/content/blog");

const files = readdirSync(join(__dirname, "../public"));
const images = files.filter((file) => file.startsWith("blog-placeholder-"));
const randomImage = images[Math.floor(Math.random() * images.length)];

const questions = [
  {
    type: "input",
    name: "title",
    message: "Título: ",
  },
  {
    type: "input",
    name: "description",
    message: "Descripción:",
  },
  {
    type: "input",
    name: "tags",
    message: "Tags (separados por coma): ",
  },
];

inquirer.prompt(questions).then((answers) => {
  let { title, description, tags } = answers;
  title = v.capitalize(title);
  tags = v.lowerCase(tags);
  const slug = slugify(title, { lower: true });
  const date = dayjs().format("YYYY-MM-DD");

  const content = readFileSync(draftPath, "utf-8");
  const newContent = content
    .replace(/title: .*/, `title: ${title}`)
    .replace(/description: .*/, `description: ${description}`)
    .replace(
      /tags: .*/,
      `tags: [${tags
        .split(",")
        .map((tag) => `"${tag.trim()}"`)
        .join(", ")}]`
    )
    .replace(/heroImage: .*/, `heroImage: /${randomImage}`)
    .replace(/pubDate: .*/, `pubDate: ${date}`);

  const newFilePath = join(blogPath, `${slug}.md`);
  writeFileSync(newFilePath, newContent);
  console.log(`Nuevo post creado en ${newFilePath}`);
});
