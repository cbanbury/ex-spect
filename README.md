# Raman Tools
A Demo web application for creating projects/organising Raman data and using self organising maps to perform multivariate Raman analysis. The application is a wrapper for the Kohonen library developed [here](https://github.com/cbanbury/kohonen)

This code is currently deployed here:

http://raman.banbury.ch

alternatively you can follow the instructions below to setup the application locally.

# Running Locally
* Install meteor (https://www.meteor.com/install)
* clone the repository
* Run the following commands from the repository directory in a terminal window:

```
meteor npm install

meteor
```
Visit http://localhost:3000

# Instructions

1. Visit the home page and create an account to get started
1. Click on `NEW PROJECT` to build a new Raman analysis project
1. Give the project a name and define a set of labels for separate groups of data you'd like to study (e.g. diseased, healthy).
1. From the projects page, click `VIEW`. Click on one of your labels to expand the table view. Click `ADD TRAINING DATA` to uopload Raman spectra.
1. Click on `FILE` and select a folder from your computer containing files that match your label (e.g. diseased). Your Raman spectra should be exported as tab-separated .txt files, with a single spectrum in each file. The first column should be wavenumber (x), and the second the Raman intensity (y). Click `SAVE`.
1. Repeat the previous step for each label.
1. Click on `MACHINE LEARNING` from the project page an setup parameters for the self organising map. Click `NEW` to build a model with the desired settings.
1. Once the model is built, click `LOAD` to view the model any toggel between the `CLUSTERING`, `FEATURES` and `CLASSIFICATION` tabs.

