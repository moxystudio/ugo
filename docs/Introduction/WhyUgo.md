# Why Ugo?

Each time a new project is created, a set of commands and configurations have to be carefully setup.
This process is tedious and we get the feeling that we are doing repetitive work, specially when the stack is mostly the same across similar projects.

Usually developers opt for:

1. Copy and pasting from the most recent project
2. Using a generator to bootstrap a project
3. Forking [kdc-scripts](https://github.com/kentcdodds/kcd-scripts) or similar and adapt to their needs
4. Using [builder](https://github.com/FormidableLabs/builder) or similar to setup the project tasks

The first two options yield a huge maintenance burden because any change will require you to apply it all projects.   
The third option is better but it lacks flexibility. Any variation of the tools must be under options, different commands or yet another fork.   
We feel that the fourth approach is the right one but the existent solutions either lack composability or are unnecessarily complex.

`ugo` aims to solve this problem by offering an extensible and composable cli where different parties may participate in the definition of commands and configurations.
