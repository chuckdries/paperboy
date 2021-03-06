# Paperboy!

Paperboy is a slack bot that's going to grow to help us around the newsroom. Right now his killer feature is the ability to crawl gryphon and watch for new articles, PMing the author of the article when it finds a new one.
Eventually, we'd like him to get smarter. I'm building this with some portability in mind, eventually maybe spinning his skills off into modules so he can be used by other gryphon customers and other newsrooms in general.
For now though, he's pretty specific to our needs.

## The near future

- [ ] Actually finish the core crawl and notify functionality
- [ ] Notify multimedia authors when the articles their stuff is attached to run

## Configuration

settings.json should point to the relative paths of the documents that store users, previously found articles, and sections and their associated URLs.

- users.json should contain a JSON object literal where the author's name as it appears in gryphon is the key and their slack username without the @ symbol should be the value
- sections.json should contain a JSON object literal where the section's name is the key and the section's url with .json at the end is the value
- array.json is automatically generated and stores the list of unique UID's that the bot has already seen so it doesn't just repeatedly remind people about old content that they've already published every time it scans. If you delete this, paperboy will ping every single author it can find with every single story they've written that still appears on the first page of the secion. It's stored as a JSON array literal, but internally when it's read it gets converted into a Set object then reconverted to an array when it needs to be written to the disk. I can't find much information about javascript's specific implementation of Set, but generally sets are better when one simply needs to check if it contains a certain unique member or not.

It's important that your slack token is in a text file simply called `token` with no extension that contains the following:
    module.exports = "a string literal of your token";
