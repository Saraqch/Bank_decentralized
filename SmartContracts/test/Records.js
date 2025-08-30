const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
// const { Contract } = require("ethers");
// const { testUtils } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Records", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  // const { network } = testUtils;

  // Objects
  const hospital = [true, "Hospital San Luis", "0991233445"];
  const doctor = [
    true,
    ["Juan Carlos", 50, "male", "juan@gmail.com", "EC", "0991022333"],
    "Doctor General",
  ];
  const patient = [
    true,
    ["Gabriel", 20, "male", "gabriel@gmail.com", "EC", "0991034567"],
  ];
  const record = ({ addr2, addr3 }) => [
    true,
    addr2,
    addr3,
    "1662610708",
    ["json", "9c6e0977d6d95e2cdf2586a6371384a472506"],
  ];

  async function deployRecords() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Records = await ethers.getContractFactory("Records");
    const recordsContract = await Records.deploy();
    await recordsContract.deployed();
    return { recordsContract, owner, addr1, addr2, addr3 };
  }

  // Register Functions

  function registerHospital(
    hospital,
    { recordsContract, owner, addr1, addr2, addr3 }
  ) {
    return recordsContract.connect(owner).addHospital(addr1.address, hospital);
  }

  function registerDoctor(
    doctor,
    { recordsContract, owner, addr1, addr2, addr3 }
  ) {
    return recordsContract.connect(addr1).addDoctor(addr2.address, doctor);
  }

  function registerPatient(
    patient,
    { recordsContract, owner, addr1, addr2, addr3 }
  ) {
    return recordsContract.connect(addr1).addPatient(addr3.address, patient);
  }

  function addRecord(record, { recordsContract, owner, addr1, addr2, addr3 }) {
    return recordsContract.connect(addr2).addRecord(record);
  }

  describe("Deployment", function () {
    /*test para deployment
    agregamos validaciones que se deban hacer al momento de hacer el deploy: valores del constructor etc*/
  });

  describe("Hospital Registration", function () {
    it("Should add a hospital", async function () {
      const { recordsContract, owner, addr1, addr2, addr3 } = await loadFixture(
        deployRecords
      );
      await expect(
        registerHospital(hospital, {
          recordsContract,
          owner,
          addr1,
          addr2,
          addr3,
        })
      ).not.to.be.reverted;
    });
  });

  describe("Doctor Registration", function () {
    it("Should add a doctor", async function () {
      const { recordsContract, owner, addr1, addr2, addr3 } = await loadFixture(
        deployRecords
      );
      registerHospital(hospital, {
        recordsContract,
        owner,
        addr1,
        addr2,
        addr3,
      });

      await expect(
        registerDoctor(doctor, {
          recordsContract,
          owner,
          addr1,
          addr2,
          addr3,
        })
      ).not.to.be.reverted;
    });
  });

  describe("Patient Registration", function () {
    it("Should add a patient", async function () {
      const { recordsContract, owner, addr1, addr2, addr3 } = await loadFixture(
        deployRecords
      );

      registerHospital(hospital, {
        recordsContract,
        owner,
        addr1,
        addr2,
        addr3,
      });

      await expect(
        registerPatient(patient, {
          recordsContract,
          owner,
          addr1,
          addr2,
          addr3,
        })
      ).not.to.be.reverted;
    });
  });

  describe("Record Registration", function () {
    it("Should add a record", async function () {
      const { recordsContract, owner, addr1, addr2, addr3 } = await loadFixture(
        deployRecords
      );

      registerHospital(hospital, {
        recordsContract,
        owner,
        addr1,
        addr2,
        addr3,
      });

      registerPatient(patient, {
        recordsContract,
        owner,
        addr1,
        addr2,
        addr3,
      });

      await expect(
        addRecord(record({ addr2, addr3 }), {
          recordsContract,
          owner,
          addr1,
          addr2,
          addr3,
        })
      ).not.to.be.reverted;
    });
  });
});
