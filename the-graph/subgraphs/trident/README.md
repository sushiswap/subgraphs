# Unit testing

## Run
```
yarn graph test <ONE-OR-MORE-TEST-NAMES>

yarn graph test MasterDeployer
```

NOTE:  
if you are running Ubuntu <20.04, matchstick 0.2.0 and above is incompatible. 
- Build a **Matchstick** image using the following command:
```
docker build -t matchstick .
```

 - The build step might take a while, but once that's done we can quickly run our tests like this:
```
docker run -it --rm --mount type=bind,source=</absolute/path/../trident>,target=/matchstick matchstick
```

To run a specific test:
```
docker run -e=<TEST_NAME> -it --rm --mount type=bind,source=</absolute/path/../trident>,target=/matchstick matchstick
```
