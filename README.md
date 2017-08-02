# egret-spine
Spine runtime for Egret.

This is a primitive implementation, aims to make it extensible.

You should be aware the skeleton renderer is flipped vertically, that's because of the difference of coordinate system.

I did this to keep code clean and simple, if you want to elimate the impact, wrap it with a container.

I will write an easy to use animation later, which takes advantage of modern asyn/await grammer, which also solves the mentioned problem.