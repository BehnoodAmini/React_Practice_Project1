import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';

import './App.css';
import { AddContact, EditContact, ViewContact, Contacts, Navbar } from './components';
import { createContact, getAllContacts, getAllGroups, deleteContact } from './services/contactService';
import { COMMENT, CURRENTLINE, FOREGROUND, PURPLE, RED } from './helpers/colors';

const App = () => {

  const [loading, setLoading] = useState(false);
  const [getContacts, setContacts] = useState([]);
  const [getGroups, setGroups] = useState([]);
  const [getContact, setContact] = useState({
    fullname: "",
    photo: "",
    mobile: "",
    email: "",
    job: "",
    group: "",
  });
  const [query, setQuery] = useState({ text: "" });
  const [getFilteredContacts, setFilteredContacts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: contactsData } = await getAllContacts();
        const { data: groupsData } = await getAllGroups();
        setContacts(contactsData);
        setFilteredContacts(contactsData);
        setGroups(groupsData);

        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchData();
  }, [])

  const createContactForm = async (event) => {
    event.preventDefault();
    try {
      const { status } = await createContact(getContact);

      if (status === 201) {
        setContact({});
        navigate("/contacts");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const setContactInfo = (event) => {
    setContact({
      ...getContact, [event.target.name]: event.target.value,
    });
  };

  const confirm = (contactId, contactFullname) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div
            dir='rtl'
            style={{
              backgroundColor: CURRENTLINE,
              border: `1px solid ${PURPLE}`,
              borderRadius: "1em"
            }}
            className="p-4"
          >
            <h1 style={{ color: RED }}>?????? ???????? ??????????</h1>
            <p style={{ color: FOREGROUND }}>
              ?????? ???? ?????? ???????? {contactFullname} ?????????????? ????????????
            </p>
            <button
              onClick={() => {
                removeContact(contactId);
                onClose();
              }}
              className="btn mx-2"
              style={{ backgroundColor: PURPLE }}
            >
              ?????????? ????????
            </button>
            <button
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: COMMENT }}
            >
              ????????????
            </button>
          </div>
        );
      },
    });
  };

  const removeContact = async (contactId) => {
    try {
      setLoading(true);
      const response = await deleteContact(contactId);
      if (response) {
        const { data: contactsData } = await getAllContacts();
        setContacts(contactsData);
        setLoading(false);
      }
    } catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  };

  const contactSearch = (event) => {
    setQuery({ ...query, text: event.target.value });
    const allContacts = getContacts.filter((contact) =>{
      return contact.fullname
        .toLowerCase()
        .includes(event.target.value.toLowerCase());  
    });

    setFilteredContacts(allContacts);
  };

  return (
    <div className="App">
      <Navbar query={query} search={contactSearch} />
      <Routes>
        <Route path='/' element={<Navigate to='/contacts' />} />
        <Route
          path='/contacts'
          element={
            <Contacts
              contacts={getFilteredContacts}
              loading={loading}
              confirmDelete={confirm}
            />
          }
        />

        <Route
          path='/contacts/add'
          element={
            <AddContact
              loading={loading}
              setContactInfo={setContactInfo}
              contact={getContact}
              groups={getGroups}
              createContactForm={createContactForm}
            />
          }
        />
        <Route path='/contacts/:contactId' element={<ViewContact />} />
        <Route path='/contacts/edit/:contactId' element={<EditContact />} />
      </Routes>
    </div>
  );
}

export default App;
