import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import Rating from "react-rating-stars-component";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Avatar,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const defaultCenter = {
  lat: 47.67014946856104,
  lng: 26.2874623814687,
};

const currentMarkerIcon = {
  url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
};

function Home() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCo_yoy3nhE2Fbb5GEOr_KB7DbowQTaOVU",
  });

  const [locations, setLocations] = useState([]);
  const [role, setRole] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [initials, setInitials] = useState("");
  const [newMarker, setNewMarker] = useState({
    name: "",
    lat: 0,
    lng: 0,
    description: "",
    imageUrl: "",
  });

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    fetchData();
    getCurrentLocation();
    const userRole = localStorage.getItem("role");
    setRole(userRole);
    setInitials(getInitials());
  }, []);
  useEffect(() => {
    const user = localStorage.getItem("userId");
    if (!user) {
      navigate("/Login");
    } else {
    }
  }, [open]);

  const getInitials = () => {
    const name = localStorage.getItem("username");
    const nameArray = name.split(" ");
    const initials = nameArray.map((word) => word.charAt(0)).join("");
    return initials.toUpperCase();
  };
  const fetchData = async () => {
    try {
      const response = await axios.get("/marker");
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedLocation(marker);
    setUserRating(marker.rating || 0);
    setImageUrl(marker.imageUrl || "/logo.png");
  };

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };

  const handleRatingChange = async (newRating) => {
    setUserRating(newRating);
    const updatedLocation = { ...selectedLocation, rating: newRating };
    setSelectedLocation(updatedLocation);

    try {
      await axios.post(`/marker/${updatedLocation._id}/rate`, {
        rating: newRating,
      });
      fetchData();
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = response.data.url;
      setImageUrl(imageUrl);

      if (selectedLocation) {
        await axios.post(`/marker/${selectedLocation._id}/update`, {
          imageUrl,
        });
        fetchData();
      } else {
        setNewMarker({ ...newMarker, imageUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleNewMarkerSubmit = async () => {
    try {
      const response = await axios.post("/marker", newMarker);
      if (response.status === 200 || response.status === 201) {
        setLocations([...locations, response.data]);
        setNewMarker({
          name: "",
          lat: 0,
          lng: 0,
          description: "",
          imageUrl: "",
        });
      } else {
        console.error("Error adding new marker");
      }
    } catch (error) {
      console.error("Error adding new marker", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMarker({ ...newMarker, [name]: value });
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    localStorage.clear();
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      anchorRef.current.focus();
    }
  }, [open]);

  return isLoaded ? (
    <div>
      <Stack
        direction="row"
        spacing={2}
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1 }}
      >
        <div>
          <Avatar
            ref={anchorRef}
            id="composition-avatar"
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            style={{ cursor: "pointer" }}
          >
            {initials}
          </Avatar>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-start" ? "left top" : "left bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-avatar"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem onClick={handleClose}>Logout</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </Stack>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={12}
      >
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={currentMarkerIcon}
            onClick={() =>
              handleMarkerClick({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                name: "Locația ta curentă",
                imageUrl: process.env.PUBLIC_URL + "/logo.png",
              })
            }
          />
        )}

        {locations.map((location) => (
          <Marker
            key={location._id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => handleMarkerClick(location)}
          />
        ))}

        {selectedLocation?.description ? (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <Card sx={{ maxWidth: 345 }}>
              {imageUrl && (
                <CardMedia
                  component="img"
                  alt={selectedLocation.name}
                  height="200"
                  image={imageUrl}
                  title={selectedLocation.name}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {selectedLocation.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {selectedLocation.description}
                </Typography>
                <Box component="fieldset" borderColor="transparent">
                  <Grid container alignItems="center">
                    <Grid item>
                      <Rating
                        count={5}
                        value={userRating}
                        onChange={handleRatingChange}
                        size={24}
                        activeColor="#ffd700"
                      />
                    </Grid>
                    <Grid item>
                      <Typography
                        component="span"
                        style={{ marginLeft: "8px" }}
                      >
                        {userRating}/5
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </InfoWindow>
        ) : null}
      </GoogleMap>

      {role === "admin" ? (
        <div
          style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
        >
          <Card sx={{ maxWidth: 345 }}>
            <CardContent>
              <Typography variant="h6">Adaugă un nou marker</Typography>
              <div>
                <label>
                  Nume:
                  <input
                    type="text"
                    name="name"
                    value={newMarker.name}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Latitudine:
                  <input
                    type="number"
                    name="lat"
                    value={newMarker.lat}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Longitudine:
                  <input
                    type="number"
                    name="lng"
                    value={newMarker.lng}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Descriere:
                  <input
                    type="text"
                    name="description"
                    value={newMarker.description}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                </label>
              </div>
              <input type="file" onChange={handleImageUpload} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleNewMarkerSubmit}
              >
                Adaugă Marker
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  ) : (
    <></>
  );
}

export default React.memo(Home);
